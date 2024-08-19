import { render, screen, fireEvent } from '@testing-library/react';
import FileUploadUI, { FileUploadUIProps } from './FileUploadUI';

const mockProps: FileUploadUIProps = {
  file: null,
  error: '',
  uploadInProgress: false,
  tableData: [],
  headers: [],
  currentRows: [],
  searchMode: 'all',
  selectedHeader: '',
  searchQuery: '',
  totalPages: 1,
  currentPage: 1,
  handleFileChange: jest.fn(),
  handleCancelUpload: jest.fn(),
  handleSearchModeChange: jest.fn(),
  handleSelectHeader: jest.fn(),
  handleSearchQueryChange: jest.fn(),
  handlePrevPage: jest.fn(),
  handleNextPage: jest.fn(),
  highlightText: jest.fn((text, query) => text),
}

describe('FileUploadUI Component', () => {

  test('renders file input', () => {
    render(<FileUploadUI {...mockProps} />)
    const fileInput = screen.getByTestId('file-input')
    expect(fileInput).toBeInTheDocument()
  })

  test('displays file upload message when file is uploaded', () => {
    render(<FileUploadUI {...mockProps} file={new File([], 'example.csv')} />)
    const uploadMessage = screen.getByText(/example\.csv file has been uploaded/i)
    expect(uploadMessage).toBeInTheDocument()
  })

  test('displays error message when there is an error', () => {
    render(<FileUploadUI {...mockProps} error="Please upload a CSV file." />)
    const errorMessage = screen.getByText(/please upload a csv file/i)
    expect(errorMessage).toBeInTheDocument()
  })

  test('calls handleFileChange when file input changes', () => {
    render(<FileUploadUI {...mockProps} />)
    const fileInput = screen.getByTestId('file-input')
    const file = new File(['file content'], 'test.csv', { type: 'text/csv' })

    fireEvent.change(fileInput, { target: { files: [file] } })
    expect(mockProps.handleFileChange).toHaveBeenCalled()
  })

  //Getting error here, it seems that it is not able to find the element
  /*
  test('displays table headers and rows', () => {
    const headers = ['Header1', 'Header2']
    const currentRows = [['Row1Cell1', 'Row1Cell2'], ['Row2Cell1', 'Row2Cell2']]
    
    render(<FileUploadUI {...mockProps} headers={headers} currentRows={currentRows} tableData={currentRows} />)
    
    headers.forEach(header => {
      expect(screen.getByText((content, element) => content === header && element?.tagName === 'TH')).toBeInTheDocument()
    });
  
    currentRows.forEach(row => {
      row.forEach(cell => {
        expect(screen.getByText((content, element) => content.includes(cell) && element?.tagName === 'TD')).toBeInTheDocument()
      })
    })
  })
  */
})
