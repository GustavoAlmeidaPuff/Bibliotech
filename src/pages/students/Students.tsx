import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Students.module.css';

interface Student {
  id: string;
  name: string;
  classroom: string;
  contact: string;
  address: string;
  number: string;
  neighborhood: string;
  complement: string;
  notes: string;
  createdAt: any;
}

interface Filters {
  name: string;
  classroom: string;
}

const Students = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    name: '',
    classroom: ''
  });
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [currentUser]);

  const fetchStudents = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const studentsRef = collection(db, `users/${currentUser.uid}/students`);
      const q = query(studentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedStudents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      setStudents(fetchedStudents);
      setFilteredStudents(fetchedStudents);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentSelection = (studentId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    const currentList = filtersApplied ? filteredStudents : students;
    if (selectedStudents.length === currentList.length) {
      // Se todos já estão selecionados, desmarca todos
      setSelectedStudents([]);
    } else {
      // Seleciona todos
      setSelectedStudents(currentList.map(student => student.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!currentUser || !window.confirm('Tem certeza que deseja excluir os alunos selecionados?')) return;

    try {
      setDeleting(true);
      for (const studentId of selectedStudents) {
        const studentRef = doc(db, `users/${currentUser.uid}/students/${studentId}`);
        await deleteDoc(studentRef);
      }
      await fetchStudents();
      setSelectedStudents([]);
      setFiltersApplied(false);
      setFilters({ name: '', classroom: '' });
    } catch (error) {
      console.error('Erro ao excluir alunos:', error);
      alert('Erro ao excluir alunos. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleRowClick = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const applyFilters = () => {
    const nameFilter = filters.name.toLowerCase().trim();
    const classroomFilter = filters.classroom.toLowerCase().trim();
    
    if (!nameFilter && !classroomFilter) {
      setFiltersApplied(false);
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(student => {
      const matchesName = !nameFilter || student.name.toLowerCase().includes(nameFilter);
      const matchesClassroom = !classroomFilter || student.classroom.toLowerCase().includes(classroomFilter);
      return matchesName && matchesClassroom;
    });
    
    setFilteredStudents(filtered);
    setFiltersApplied(true);
  };

  const clearFilters = () => {
    setFilters({ name: '', classroom: '' });
    setFiltersApplied(false);
    setFilteredStudents(students);
  };

  const currentStudents = filtersApplied ? filteredStudents : students;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Cadastro de Alunos</h2>
        <div className={styles.headerActions}>
          {selectedStudents.length > 0 && (
            <>
              <button
                className={styles.selectAllButton}
                onClick={handleSelectAll}
              >
                {selectedStudents.length === currentStudents.length && currentStudents.length > 0 
                  ? 'Desmarcar Todos' 
                  : 'Selecionar Todos'}
              </button>
              <button
                className={styles.deleteButton}
                onClick={handleDeleteSelected}
                disabled={deleting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.buttonIcon}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                {deleting ? 'Excluindo...' : 'Excluir Selecionados'}
              </button>
            </>
          )}
          <button
            className={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.buttonIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            {filtersApplied ? 'Filtros Aplicados' : 'Mostrar Filtros'}
          </button>
          <Link to="/students/register" className={styles.registerButton}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.buttonIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Registrar Aluno
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filters}>
          <form onSubmit={handleSubmit} className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label htmlFor="name">Nome</label>
              <input
                type="text"
                id="name"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Filtrar por nome..."
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="classroom">Turma</label>
              <input
                type="text"
                id="classroom"
                value={filters.classroom}
                onChange={(e) => handleFilterChange('classroom', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Filtrar por turma..."
              />
            </div>
          </form>

          <div className={styles.filterActions}>
            <button
              className={styles.applyFiltersButton}
              onClick={applyFilters}
            >
              Aplicar Filtros
            </button>
            <button
              className={styles.clearFiltersButton}
              onClick={clearFilters}
              disabled={!filtersApplied}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : students.length === 0 ? (
          <div className={styles.emptyState}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.emptyIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.479m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <h3>Nenhum aluno registrado</h3>
            <p>Clique em "Registrar Aluno" para adicionar seu primeiro aluno.</p>
            <Link to="/students/register" className={styles.registerButton}>
              Registrar Aluno
            </Link>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            {filtersApplied && filteredStudents.length === 0 ? (
              <div className={styles.noResults}>
                <p>Nenhum aluno encontrado com os filtros aplicados.</p>
                <button
                  className={styles.clearFiltersButton}
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.checkboxColumn}>
                      <div className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === currentStudents.length && currentStudents.length > 0}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th>Nome</th>
                    <th>Turma</th>
                    <th>Contato</th>
                    <th>Endereço</th>
                    <th>Número</th>
                    <th>Bairro</th>
                    <th>Complemento</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map(student => (
                    <tr 
                      key={student.id} 
                      className={`${styles.studentRow} ${selectedStudents.includes(student.id) ? styles.selected : ''}`}
                      onClick={() => handleRowClick(student.id)}
                    >
                      <td 
                        className={styles.checkboxColumn}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStudentSelection(student.id);
                        }}
                      >
                        <div className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStudentSelection(student.id, e);
                            }}
                            readOnly
                          />
                        </div>
                      </td>
                      <td>{student.name}</td>
                      <td>{student.classroom}</td>
                      <td>{student.contact || '-'}</td>
                      <td>{student.address || '-'}</td>
                      <td>{student.number || '-'}</td>
                      <td>{student.neighborhood || '-'}</td>
                      <td>{student.complement || '-'}</td>
                      <td>{student.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Students; 