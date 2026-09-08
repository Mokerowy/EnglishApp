export const mockStudents = [
  { id: "s1", name: "Jan Kowalski", age: 15, level: "B1", status: "Zaległości", progress: 85, phone: "123-456-789", assignedTeachers: ["t1"], globalNotes: [], debt: 450, paymentHistory: [{ date: "2023-09-05", amount: 200, status: "Opłacone" }, { date: "2023-10-05", amount: 200, status: "Opłacone" }] },
  { id: "s2", name: "Maria Nowak", age: 16, level: "B1", status: "Aktywny", progress: 92, phone: "987-654-321", assignedTeachers: [], globalNotes: [] },
  { id: "s3", name: "Piotr Wiśniewski", age: 14, level: "B1", status: "Aktywny", progress: 78, phone: "111-222-333", assignedTeachers: ["t1", "t2"], globalNotes: [] },
  
  { id: "s4", name: "Anna Lewandowska", age: 25, level: "C1", status: "Aktywny", progress: 95, phone: "444-555-666", assignedTeachers: ["t2"], globalNotes: [] },
  { id: "s5", name: "Michał Wójcik", age: 28, level: "C1", status: "Aktywny", progress: 88, phone: "777-888-999", assignedTeachers: [], globalNotes: [] },
  { id: "s6", name: "Katarzyna Kamińska", age: 24, level: "C1", status: "Zaległości", progress: 60, phone: "000-111-222", assignedTeachers: [], globalNotes: [] },

  { id: "s7", name: "Zofia Dąbrowska", age: 10, level: "A2", status: "Aktywny", progress: 80, phone: "333-444-555", assignedTeachers: [], globalNotes: [] },
  { id: "s8", name: "Antoni Kaczmarek", age: 11, level: "A2", status: "Zaległości", progress: 50, phone: "666-777-888", assignedTeachers: [], globalNotes: [] }
];

export const mockTeachers = [
  { id: "t1", name: "Anna Kowalska", contractType: "UoP", vacationBalance: 26 },
  { id: "t2", name: "Marek Wiśniewski", contractType: "B2B", vacationBalance: 20 },
  { id: "t3", name: "John Smith (Native)", contractType: "B2B", vacationBalance: 0 }
];

export const mockGroups = [
  { 
    id: "g1", 
    name: "Angielski B1 - Dorośli", 
    type: "Grupowe", 
    level: "B1",
    studentIds: ["s1", "s7"],
    assignedTeachers: ["t1"],
    globalNotes: []
  },
  { 
    id: "g2", 
    name: "Angielski C1 - Zaawansowani", 
    type: "Grupowe", 
    level: "C1",
    studentIds: ["s3", "s4", "s5"],
    assignedTeachers: ["t1"],
    globalNotes: []
  },
  { 
    id: "g3", 
    name: "Anna Nowak - Indywidualne", 
    type: "Indywidualne", 
    level: "A2",
    studentIds: ["s2"],
    assignedTeachers: ["t2"],
    globalNotes: []
  },
  { 
    id: "g4", 
    name: "Dzieci Szkolne A1", 
    type: "Grupowe", 
    level: "A1",
    studentIds: ["s6"],
    assignedTeachers: ["t2"],
    globalNotes: []
  }
];

export const mockRooms = ["Sala 1", "Sala 2", "Sala 3", "Sala 4 (Online)"];

// Zajęcia i urlopy (na potrzeby walidacji konfliktów w portalu klienta)
export const mockSchedules = [
  { id: "e1", teacherId: "t1", dayOfWeek: 2, startHour: 16, endHour: 17.5, type: "Lesson" }, // Wtorek 16:00-17:30
  { id: "e2", teacherId: "t2", dayOfWeek: 2, startHour: 16, endHour: 17.5, type: "Lesson" }, // Wtorek 16:00-17:30
  { id: "e3", teacherId: "t3", dayOfWeek: 2, startHour: 16, endHour: 17.5, type: "Lesson" }, // Wtorek 16:00-17:30 (Wszyscy zajęci we wtorek o 16!)
  
  { id: "e4", teacherId: "t1", dayOfWeek: 3, startHour: 18, endHour: 19.5, type: "Lesson" }, // Środa 18:00-19:30
  { id: "e5", teacherId: "t2", startDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1).toISOString().split('T')[0], endDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3).toISOString().split('T')[0], startHour: 0, endHour: 24, type: "Holiday", status: "pending" }, // Przykładowy urlop na kilka dni
];

export const defaultCalendarEvents = [
  { id: 1, title: 'Angielski B1 (A. Kowalska)', start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 16, 0).toISOString(), end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 17, 30).toISOString(), teacher: 'Anna Kowalska', teacherId: 't1', group: 'Angielski B1', topic: 'Czas Present Perfect', adminNote: 'Grupa świetnie radzi sobie z zagadnieniami gramatycznymi, ale 2 osoby ciągle spóźniają się na lekcje.', parentsNote: '', room: "Sala 3", reported: false, groupId: "g1", studentNotes: {} },
  { id: 2, title: 'Angielski C1 (A. Kowalska)', start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 18, 0).toISOString(), end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 19, 30).toISOString(), teacher: 'Anna Kowalska', teacherId: 't1', room: "Sala 5", reported: false, groupId: "g2", adminNote: '', parentsNote: '', topic: '', group: 'Angielski C1', studentNotes: {} },
  { id: 3, title: 'Angielski B1 (A. Kowalska)', start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2, 16, 0).toISOString(), end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 2, 17, 30).toISOString(), teacher: 'Anna Kowalska', teacherId: 't1', room: "Sala 3", reported: false, groupId: "g1", adminNote: '', parentsNote: '', topic: '', group: 'Angielski B1', studentNotes: {} },
  { id: 4, title: 'Angielski A2 (A. Kowalska)', start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 17, 0).toISOString(), end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 18, 30).toISOString(), teacher: 'Anna Kowalska', teacherId: 't1', room: "Sala 2", reported: false, groupId: "g4", adminNote: '', parentsNote: '', topic: '', group: 'Angielski A2', studentNotes: {} },
];
