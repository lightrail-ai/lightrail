import { render } from '@testing-library/react';
import React from 'react';
import ProjectInterfaceEditor, { ProjectInterfaceEditorProps } from './ProjectInterfaceEditor';

describe('ProjectInterfaceEditor', () => {
    const defaultProps: ProjectInterfaceEditorProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<ProjectInterfaceEditor {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('ProjectInterfaceEditor')).toBeTruthy();
    });
});
