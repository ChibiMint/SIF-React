import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
  } from 'react'
  
  type Value = {
    selectedGroup: string | null
    setSelectedGroup: (v: string | null) => void
    selectedCategory: string | null
    setSelectedCategory: (v: string | null) => void
    resetFilters: () => void
  }
  
  const MultimediaContext = createContext<Value | null>(null)

  /** Provee a Multi y Swipe el estado de filtros (grupo y categoría) compartido en la ruta multimedia. */
  export function MultimediaProvider({ children }: { children: ReactNode }) {
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
    /** Vuelve a “sin filtrar”: muestra todo lo que el carrusel permita según su lógica (null = todos). */
    const resetFilters = useCallback(() => {
      setSelectedGroup(null)
      setSelectedCategory(null)
    }, [])
  
    const value = useMemo(
      () => ({
        selectedGroup,
        setSelectedGroup,
        selectedCategory,
        setSelectedCategory,
        resetFilters,
      }),
      [selectedGroup, selectedCategory, resetFilters],
    )
  
    return (
      <MultimediaContext.Provider value={value}>{children}</MultimediaContext.Provider>
    )
  }
  
  /** Hook para leer y actualizar filtros; debe usarse dentro de un árbol envuelto por MultimediaProvider. */
  export function useMultimedia() {
    const ctx = useContext(MultimediaContext)
    if (!ctx) throw new Error('useMultimedia: fuera de MultimediaProvider')
    return ctx
  }