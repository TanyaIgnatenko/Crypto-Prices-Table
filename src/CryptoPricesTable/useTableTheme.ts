import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/mantine';

export function useTableTheme() {
  return useTheme([
    getTheme(),
    {
      Table: `
            --data-table-library_grid-template-columns:  80px 240px 275px 275px 275px 275px 280px;
            `,

      HeaderCell: `
        & {
          border-top: 1px solid #202020;
          font-size: 12px;
        }
      `,

      BaseCell: `
            & {
              height: 54px;
              padding: 0 16px;
              color: white;
              border-bottom: none !important;
            }  
  
            &:nth-of-type(1) {
              left: 0px;
              background: #0C0A1D;
            }
      
            &:nth-of-type(2) {
              left: 80px;
              background: #0C0A1D;
              border-right: 1px solid #202020;
            }
  
            &:nth-of-type(n + 3) {
              background: #1D1229;
            }

            & > div {
              display: flex;
              align-items: center;
            }
        `,
    },
  ]);
}
