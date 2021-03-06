import React, { useEffect, useState } from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import { Field as FormikField, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import useFlash from '@/plugins/useFlash';
import useServer from '@/plugins/useServer';
import createServerBackup from '@/api/server/backups/createServerBackup';
import { httpErrorToHuman } from '@/api/http';
import FlashMessageRender from '@/components/FlashMessageRender';
import { ServerContext } from '@/state/server';
import Button from '@/components/elements/Button';
import tw from 'twin.macro';
import { Textarea } from '@/components/elements/Input';

interface Values {
    name: string;
    ignored: string;
}

const ModalContent = ({ ...props }: RequiredModalProps) => {
    const { isSubmitting } = useFormikContext<Values>();

    return (
        <Modal {...props} showSpinnerOverlay={isSubmitting}>
            <Form>
                <FlashMessageRender byKey={'backups:create'} css={tw`mb-4`}/>
                <h2 css={tw`text-2xl mb-6`}>Create server backup</h2>
                <div css={tw`mb-6`}>
                    <Field
                        name={'name'}
                        label={'Backup name'}
                        description={'If provided, the name that should be used to reference this backup.'}
                    />
                </div>
                <div css={tw`mb-6`}>
                    <FormikFieldWrapper
                        name={'ignored'}
                        label={'Ignored Files & Directories'}
                        description={`
                            Enter the files or folders to ignore while generating this backup. Leave blank to use
                            the contents of the .pteroignore file in the root of the server directory if present.
                            Wildcard matching of files and folders is supported in addition to negating a rule by
                            prefixing the path with an exclamation point.
                        `}
                    >
                        <FormikField as={Textarea} name={'ignored'} css={tw`h-32`}/>
                    </FormikFieldWrapper>
                </div>
                <div css={tw`flex justify-end`}>
                    <Button type={'submit'} disabled={isSubmitting}>
                        Start backup
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default () => {
    const { uuid } = useServer();
    const { addError, clearFlashes } = useFlash();
    const [ visible, setVisible ] = useState(false);

    const appendBackup = ServerContext.useStoreActions(actions => actions.backups.appendBackup);

    useEffect(() => {
        clearFlashes('backups:create');
    }, [ visible ]);

    const submit = ({ name, ignored }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('backups:create');
        createServerBackup(uuid, name, ignored)
            .then(backup => {
                appendBackup(backup);
                setVisible(false);
            })
            .catch(error => {
                console.error(error);
                addError({ key: 'backups:create', message: httpErrorToHuman(error) });
                setSubmitting(false);
            });
    };

    return (
        <>
            {visible &&
            <Formik
                onSubmit={submit}
                initialValues={{ name: '', ignored: '' }}
                validationSchema={object().shape({
                    name: string().max(255),
                    ignored: string(),
                })}
            >
                <ModalContent appear visible={visible} onDismissed={() => setVisible(false)}/>
            </Formik>
            }
            <Button onClick={() => setVisible(true)}>
                Create backup
            </Button>
        </>
    );
};
