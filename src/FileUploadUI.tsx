import React from 'react'

interface FileUploadUIProps {
  file: File | null
  error: string
  uploadInProgress: boolean
  tableData: string[][]
  headers: string[]
  currentRows: string[][]
  searchMode: 'all' | 'selected'
  selectedHeader: string
  searchQuery: string
  totalPages: number
  currentPage: number
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleCancelUpload: () => void
  handleSearchModeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  handleSelectHeader: (event: React.ChangeEvent<HTMLSelectElement>) => void
  handleSearchQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handlePrevPage: () => void
  handleNextPage: () => void
  highlightText: (text: string, query: string) => React.ReactNode
}

const FileUploadUI: React.FC<FileUploadUIProps> = ({
  file, error, uploadInProgress, tableData, headers, currentRows, searchMode, 
  selectedHeader, searchQuery, totalPages, currentPage, handleFileChange, 
  handleCancelUpload, handleSearchModeChange, handleSelectHeader, 
  handleSearchQueryChange, handlePrevPage, handleNextPage, highlightText
}) => (
  <div>
    <input type="file" accept=".csv" data-testid="file-input" onChange={handleFileChange} />
    {file && !error && !uploadInProgress && <p className="uploadFile">{file.name} file has been uploaded.</p>}
    {error && <p className="error">{error}</p>}
    {uploadInProgress && <p>Upload file in progress...</p>}
    {uploadInProgress && <button onClick={handleCancelUpload}>Cancel Upload</button>}

    {tableData.length > 0 && (
      <>
        <div className="search-container">
          <select value={searchMode} onChange={handleSearchModeChange}>
            <option value="all">Search All</option>
            <option value="selected">Search By</option>
          </select>
          {searchMode === 'selected' && (
            <select value={selectedHeader} onChange={handleSelectHeader}>
              {headers.map((header, index) => (
                <option key={index} value={header}>
                  {header}
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchQueryChange}
            disabled={searchMode === 'selected' && !selectedHeader}
          />
        </div>

        {currentRows.length === 0 ? (
          <p className="no-result">No record found</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{highlightText(cell, searchQuery)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </>
        )}
      </>
    )}
  </div>
)

export default FileUploadUI
