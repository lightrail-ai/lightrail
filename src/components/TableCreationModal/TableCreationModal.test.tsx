import { render } from '@testing-library/react';
import React from 'react';
import TableCreationModal, { TableCreationModalProps } from './TableCreationModal';

describe('TableCreationModal', () => {
    const defaultProps: TableCreationModalProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<TableCreationModal {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('TableCreationModal')).toBeTruthy();
    });
});
