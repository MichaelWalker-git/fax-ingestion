export const PROCESSING_MODES = {
  QA: 'QA',
  FORM: 'FORM',
  TEXT: 'TEXT',
  TABLE: 'TABLE',
  QA_CHOICE: 'QA_CHOICE',
  MEDICARE: 'MEDICARE',
  RENTAL_APP: 'RENTAL_APP',
}

export type PROCESSING_MODES_TYPE = (typeof PROCESSING_MODES)[keyof typeof PROCESSING_MODES]

export const PROCESSING_TYPES = {
  FORM: 'FORM',
  TEXT: 'TEXT',
  TABLE: 'TABLE',
}

export const PROCESSING_MODES_PRETTY = {
  [PROCESSING_MODES.FORM]: 'Form Extraction',
  [PROCESSING_MODES.TEXT]: 'Text Extraction',
  [PROCESSING_MODES.TABLE]: 'Table Extraction',
  [PROCESSING_MODES.QA]: 'Question Answering',
}

export const TEXT_EXTRACTION_PROMPT =
  'Extract all readable text from the provided image.' +
  ' Return only the exact text found in the image, with no additional words, explanations,' +
  'or formatting beyond what appears in the image.'

export const TABLE_EXTRACTION_PROMPT = `Please identify all tables and parse it into a standardized JSON format with two top-level keys: "tableName", "columns" and "rows".

### Format requirements

1. Name of table - if couldn't find just put number like "Table 1"
2. **"columns"**: An array of objects, each describing one column.
   - Each object must have:
     - "field": A string identifier (e.g., "price", "firstName").
     - "headerName": The original column header text from the table.
     - "totalRows": a numeric field representing the total number of rows detected in the PDF table.
     - Additionally, each column should include a "flex" property, which is a number used to automatically expand or shrink the column to fill all available horizontal space. For     instance:
     - "flex": A numeric value indicating how the column should expand/shrink to fill horizontal space.
       - **Important**: The "flex" value must be computed from the **data** in that column, not the header text length.
         - For example, for each column:
           1. Find the **maximum** (or average) cell value length among all rows in that column.
           2. Compare it to the maximum lengths of the other columns.
           3. Assign a \`flex\` proportionally. For instance:
              \\[
                \\text{flex}_\\text{col} 
                  = \\frac{\\text{maxDataLengthOfThisColumn}}{\\sum(\\text{maxDataLengthOfAllColumns})}
                  \\times \\text{someScaleFactor}
              \\]
         - This ensures columns containing longer values get proportionally more width.
       - If a column is entirely numeric and the values are short, its \`flex\` should be relatively small. If a column has very long text in its cells, its \`flex\` should be larger.
      - If some columns have \`"flex": 2\` and others \`"flex": 1\`, the columns with \`2\` will get twice as much leftover space as those with \`1\`.
3. **"columnGroups"**: An array of objects that define top-level or intermediate group headers.
   - Each group object should have:
     - groupId: a string used to identify the group
     - "headerName": The text for the group header (e.g., "Results").
     - "children": An array of references to the leaf columns that belong under this group.
       - Each child can be identified by its "field", or you may embed the same structure (depending on your needs).
       - Example:
         \`\`\`json
         {
           "headerName": "Results",
           "children": [
             { "field": "accuracy" },
             { "field": "timeToComplete" }
           ]
         }
         \`\`\`
4. **"rows"**: An array of objects, each describing one row of the table.
   - Each row object must have:
     - "id": A unique numeric or string identifier for the row.
     - "depth": A numeric level of nesting (0 for top-level, 1 for a child, 2 for a sub-child, 3 for even deeper levels, etc.).
       - For example:
         \`\`\`json
         {
           "id": 3,
           "lineItem": "Change in net unrealized gains (losses)",
           "threeMonths2023": "62",
           "threeMonths2024": "167",
           "depth": 2
         }
         \`\`\`
       - This indicates the row is two levels below a top-level parent.
     - Other properties that match the "field" values defined in the "columns" array.
       - For example, if columns have \`field: "price"\` and \`field: "product"\`, each row should include \`"price": ...\` and \`"product": ...\` with the corresponding cell values.
     - **Row limit**: If the table in the PDF has more than 25 rows, **only output the first 25** rows here.
     - Make sure to still set "totalRows" to the actual total number of rows in the PDF table, even if only 25 appear in "rows". 

5. No any other text in the result, only JSON format result. You should not write something like "This is result:". Only an array in JSON format.

6. If the PDF text does not contain a recognizable table, "result" field should contain just empty array.

7. The "result" field should be an array, even only one table is found

8. **totalRows**: 
   - A numeric field indicating how many rows (in total) the table had.
   - Example: If the table has 100 rows, but we only return the first 25 in "rows", then "totalRows" should be 100.
   - If the are 2 tables, return only 10 rows of each table.
9. Add to response accuracy results as value is between 0 to 100. Where 0 is worst and 100 is best.:
  - Critically evaluate its accuracy, relevance, and completeness. 
  - Identify any potential biases, gaps, or areas for improvement, and suggest refinements if necessary.
  - If response contains form Fields, table rows, or other structured data, evaluate accuracy of each field, row or other structure. 
10. Example of the response:
     {
       "accuracy": 0 - 100,
       "result": [ {
       "tableName": "Segment Information",
       "columns": [{...}, {...}],       
       "columnGroups": [{...}, {...}],
       "rows": [{...}, {...}],
       "totalRows": 100
       }]
     }
   `
