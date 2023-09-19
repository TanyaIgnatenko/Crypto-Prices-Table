import { useTheme } from '@table-library/react-table-library/theme';
import {
    getTheme,
} from '@table-library/react-table-library/mantine';

export function useTableTheme() {
    return useTheme([
        getTheme(),
        {
            Table: `
            --data-table-library_grid-template-columns:  150px 450px 400px 400px 400px 400px;
            `,
            BaseCell: ` 
              &:nth-of-type(1) {
                left: 0px;
              }
        
              &:nth-of-type(2) {
                left: 150px;
              }

              & > div {
                display: flex;
                align-items: center;
              }
        `,
        },
    ]);
}