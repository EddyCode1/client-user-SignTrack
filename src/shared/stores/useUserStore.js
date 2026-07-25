import { create } from 'zustand'

const useUserStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,

  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addUser: (user) =>
    set((state) => ({
      users: [...state.users, { ...user, _id: Date.now().toString() }],
    })),

  updateUser: (id, updatedUser) =>
    set((state) => ({
      users: state.users.map((user) =>
        user._id === id ? { ...user, ...updatedUser } : user
      ),
    })),

  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user._id !== id),
    })),

  getUserById: (id) => get().users.find((user) => user._id === id),
}))

export default useUserStore
