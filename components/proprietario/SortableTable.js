'use client';

import { useState } from 'react';
import styles from './pages.module.css';

export default function SortableTable({ columns, rows, error, emptyTitle, emptyMessage }) {
  const [sorting, setSorting] = useState({ key: 'number', direction: 'desc' });

  const sortedRows = [...rows].sort((left, right) => {
    const column = columns.find((item) => item.key === sorting.key);
    const leftValue = left.sortValues[sorting.key];
    const rightValue = right.sortValues[sorting.key];
    let comparison;

    if (column.type === 'number') {
      comparison = Number(leftValue ?? 0) - Number(rightValue ?? 0);
    } else {
      comparison = String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'pt-BR', {
        numeric: true,
        sensitivity: 'base',
      });
    }

    return sorting.direction === 'asc' ? comparison : -comparison;
  });

  function changeSorting(column) {
    setSorting((current) => ({
      key: column.key,
      direction: current.key === column.key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => {
              const active = sorting.key === column.key;
              const direction = active ? sorting.direction : null;

              return (
                <th
                  aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  key={column.key}
                  scope="col"
                >
                  {column.sortable ? (
                    <button
                      aria-label={`Ordenar por ${column.label}${direction ? `, ${direction === 'asc' ? 'crescente' : 'decrescente'}` : ''}`}
                      className={styles.sortButton}
                      onClick={() => changeSorting(column)}
                      type="button"
                    >
                      {column.label}
                      <span aria-hidden="true">{direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}</span>
                    </button>
                  ) : column.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.emptyState}>
                <strong>{error ? 'Não foi possível carregar os dados' : emptyTitle}</strong>
                <span>{error || emptyMessage}</span>
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td className={column.className} key={column.key}>
                    {column.subKey ? (
                      <>
                        <strong>{row[column.key]}</strong>
                        <span className={styles.subText}>{row[column.subKey]}</span>
                      </>
                    ) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}