import React, { useState, useMemo, useEffect } from 'react'
import Papa from 'papaparse'
import './Main.css'

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [tableData, setTableData] = useState<string[][]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(15)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedHeader, setSelectedHeader] = useState<string>('')
  const [searchMode, setSearchMode] = useState<'all' | 'selected'>('all')
  const [error, setError] = useState<string>('')
  const [uploadInProgress, setUploadInProgress] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  useEffect(() => {
    if (headers.length > 0) {
      setSelectedHeader(headers[0])
    }
  }, [headers])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0]

      if(selectedFile.type !== 'text/csv') {
        setError('Please upload a CSV file.')
        setHeaders([])
        setTableData([])
        setFile(null)
        return
      }
      setError('')
      setFile(selectedFile)
      setUploadInProgress(true)

      if (abortController) {
        abortController.abort()
      }

      const controller = new AbortController()
      setAbortController(controller)

      Papa.parse(selectedFile, {
        complete: (result) => {
          const data = result.data as string[][]
          setHeaders(data[0])
          setTableData(data.slice(1))
          setCurrentPage(1)
          setUploadInProgress(false)
        },
        header: false,
      })
    }
  }

  const handleCancelUpload = () => {
    if(abortController) {
        abortController.abort()
        setError('Upload has been canceled.')
        setUploadInProgress(false)
        setHeaders([])
        setTableData([])
        setFile(null)
    }
  }

  const handleSearchQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setCurrentPage(1)
  }

  const handleSelectHeader = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHeader(event.target.value)
    setCurrentPage(1)
  }

  const handleSearchModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchMode(event.target.value as 'all' | 'selected')
    setCurrentPage(1)
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} style={{ backgroundColor: 'yellow' }}>
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const filteredData = useMemo(() => {
    if (!searchQuery) return tableData;

    if (searchMode === 'selected' && selectedHeader) {
      const headerIndex = headers.indexOf(selectedHeader)
      if (headerIndex === -1) return tableData

      return tableData.filter(row =>
        row[headerIndex]?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (searchMode === 'all') {
      return tableData.filter(row =>
        row.some(cell => cell.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    return tableData;
  }, [searchQuery, searchMode, selectedHeader, tableData, headers])

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow)
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
  }

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
  }

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
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

          {filteredData.length === 0 ? (
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
                    <tr key={indexOfFirstRow + rowIndex}>
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
}

export default FileUpload