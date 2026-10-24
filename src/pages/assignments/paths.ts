export type Area = 'trainer' | 'admin'

/** Trainers grade under "Grade assignments"; admins see assignments under "Courses & sessions". */
export const assignmentBase = (area: Area) => (area === 'trainer' ? '/trainer/grading' : '/admin/courses/assignments')
