
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ExamPaperData } from '../types';

export const saveExamPaper = async (userId: string, data: ExamPaperData) => {
  const path = 'examPapers';
  try {
    const docRef = await addDoc(collection(db, path), {
      userId,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const subscribeToMyPapers = (userId: string, callback: (papers: any[]) => void) => {
  const path = 'examPapers';
  const q = query(collection(db, path), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const papers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(papers);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const deletePaper = async (id: string) => {
  const path = `examPapers/${id}`;
  try {
    await deleteDoc(doc(db, 'examPapers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
