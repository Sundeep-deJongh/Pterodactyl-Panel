import React from 'react';
import Modal, { RequiredModalProps } from '@/components/elements/Modal';
import tw from 'twin.macro';

const ChecksumModal = ({ checksum, ...props }: RequiredModalProps & { checksum: string }) => (
    <Modal {...props}>
        <h3 css={tw`mb-6`}>Verify file checksum</h3>
        <p css={tw`text-sm`}>
            The SHA256 checksum of this file is:
        </p>
        <pre css={tw`mt-2 text-sm p-2 bg-neutral-900 rounded`}>
            <code css={tw`block font-mono`}>{checksum}</code>
        </pre>
    </Modal>
);

export default ChecksumModal;
