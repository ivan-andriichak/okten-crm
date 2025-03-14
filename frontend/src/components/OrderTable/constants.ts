export  const tableStyles = {
  table: {
    width: '95%',
    borderCollapse: 'collapse' as const,
    margin: '0 auto',
    backgroundColor: '#f7f8fa',
    tableLayout: 'fixed' as const,
  },
  th: {
    border: '1px solid #ddd',
    padding: '8px',
    cursor: 'pointer',
    backgroundColor: '#e2ebfd',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  expandedTd: {
    border: '1px solid #ddd',
    padding: '8px',
    backgroundColor: '#f9f9f9',
  },
};

export const columnWidths = {
  id: '5%',
  name: '8%',
  surname: '8%',
  email: '12%',
  phone: '10%',
  age: '5%',
  course: '8%',
  course_format: '8%',
  course_type: '8%',
  status: '8%',
  sum: '5%',
  alreadyPaid: '8%',
  group: '8%',
  created_at: '10%',
  manager: '8%',
};


export const columns = [
  { key: 'id', label: 'ID', sortable: true, width: columnWidths.id },
  { key: 'name', label: 'Name', sortable: true, width: columnWidths.name },
  { key: 'surname', label: 'Surname', sortable: true, width: columnWidths.surname },
  { key: 'email', label: 'Email', sortable: true, width: columnWidths.email },
  { key: 'phone', label: 'Phone', sortable: true, width: columnWidths.phone },
  { key: 'age', label: 'Age', sortable: true, width: columnWidths.age },
  { key: 'course', label: 'Course', sortable: false, width: columnWidths.course },
  { key: 'course_format', label: 'Course Format', sortable: false, width: columnWidths.course_format },
  { key: 'course_type', label: 'Course Type', sortable: false, width: columnWidths.course_type },
  { key: 'status', label: 'Status', sortable: true, width: columnWidths.status },
  { key: 'sum', label: 'Sum', sortable: false, width: columnWidths.sum },
  { key: 'alreadyPaid', label: 'Already Paid', sortable: false, width: columnWidths.alreadyPaid },
  { key: 'group', label: 'Group', sortable: false, width: columnWidths.group },
  { key: 'created_at', label: 'Created At', sortable: true, width: columnWidths.created_at },
  { key: 'manager', label: 'Manager', sortable: true, width: columnWidths.manager },
];