import { createGlobalStyle } from 'styled-components';

export const TableStyles = createGlobalStyle`
  table tbody td,
  table thead th {
    padding: 12px 8px;
    line-height: 20px;
  }

  .truncate-cell {
    max-width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
  }

  .truncate-cell:hover .tooltip {
    display: block;
  }

  .tooltip {
    display: none;
    position: absolute;
    z-index: 50;
    padding: 8px;
    background-color: #1F2937;
    color: white;
    font-size: 0.875rem;
    border-radius: 0.375rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    white-space: normal;
    word-break: break-word;
    max-width: 400px;
    left: 0;
    bottom: -4px;
    transform: translateY(100%);
  }

  #serp-tables-container {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 1.5rem;
    padding: 1rem 0;
    margin: 0 1rem;
  }

  #serp-tables-container > * {
    scroll-snap-align: start;
    flex-shrink: 0;
  }

  table tbody tr {
    border-bottom: 1px solid #e5e7eb;
  }

  .dark table tbody tr {
    border-bottom: 1px solid #374151;
  }

  table thead {
    border-bottom: 1px solid #e5e7eb;
  }

  .dark table thead {
    border-bottom: 1px solid #374151;
  }
`;
