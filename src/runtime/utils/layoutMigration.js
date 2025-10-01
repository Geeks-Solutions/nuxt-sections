
/**
 * Migrates old layout format to new format
 */
export function migrateOldLayout(pageData, rowId) {
  const layoutName = pageData.layout;
  const sections = pageData.sections || [];

  // If already migrated, return as-is
  if (pageData.metadata?.layoutRows) {
    return pageData;
  }

  if (layoutName === 'standard') {
    let layoutRows = []
    const updatedSections = sections.map((section, index) => {
      const newRowId = rowId.value + (index + 1).toString(); // ensures unique row for each section

      layoutRows.push({
        row: newRowId,
        cols: 2,
        weight: 0
      });

      return {
        ...section,
        region: {
          row: newRowId,
          col: 0,
          weight: section.weight || 0
        }
      };
    });

    return {
      ...pageData,
      metadata: {
        ...pageData.metadata,
        layoutRows
      },
      sections: updatedSections
    };
  }

  // Extract unique slots and sort them
  const slots = [...new Set(
    sections
      .filter(s => s.region[layoutName]?.slot)
      .map(s => s.region[layoutName].slot)
  )].sort();

  // Create layoutRows from slots
  const layoutRows = slots.map((slot, index) => {
    // Parse slot name to determine columns (e.g., "region2-2" means 2 columns)
    const match = slot.match(/region(\d+)-(\d+)/);
    const cols = match ? Number.parseInt(match[2]) : 1;

    return {
      row: index,
      cols: cols,
      colWidths: Array(cols).fill(100 / cols),
      weight: index
    };
  });

  // Update sections to new region format
  const updatedSections = sections.map(section => {
    const oldRegion = section.region[layoutName];
    if (!oldRegion) return section;

    const rowIndex = slots.indexOf(oldRegion.slot);

    return {
      ...section,
      region: {
        row: rowIndex,
        col: 0, // Default to first column
        weight: oldRegion.weight || 0
      }
    };
  });

  return {
    ...pageData,
    metadata: {
      ...pageData.metadata,
      layoutRows
    },
    sections: updatedSections
  };
}

/**
 * Validates layout structure
 */
export function validateLayout(pageData) {
  const errors = [];
  const layoutRows = pageData.metadata?.layoutRows || [];
  const sections = pageData.sections || [];

  // Validate layoutRows
  layoutRows.forEach((row, index) => {
    if (row.cols < 1 || row.cols > 6) {
      errors.push(`Row ${row.row}: Invalid column count (${row.cols})`);
    }

    if (row.colWidths.length !== row.cols) {
      errors.push(`Row ${row.row}: colWidths length (${row.colWidths.length}) doesn't match cols (${row.cols})`);
    }

    const widthSum = row.colWidths.reduce((a, b) => a + b, 0);
    if (Math.abs(widthSum - 100) > 0.01) {
      errors.push(`Row ${row.row}: Column widths sum to ${widthSum}% instead of 100%`);
    }
  });

  // Validate section regions
  sections.forEach(section => {
    const { row, col, weight } = section.region || {};

    if (row === undefined || col === undefined) {
      errors.push(`Section ${section.id}: Missing row or col in region`);
      return;
    }

    const layoutRow = layoutRows.find(r => r.row === row);
    if (!layoutRow) {
      errors.push(`Section ${section.id}: References non-existent row ${row}`);
    } else if (col >= layoutRow.cols) {
      errors.push(`Section ${section.id}: Column index ${col} out of bounds for row ${row} (max: ${layoutRow.cols - 1})`);
    }
  });

  return errors;
}
