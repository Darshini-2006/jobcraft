'use client';

import { setDoc, addDoc, updateDoc, deleteDoc, CollectionReference, DocumentReference, SetOptions } from 'firebase/firestore';

export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options?: SetOptions) {
  setDoc(docRef, data, options || {}).catch((error) => {
    console.error('setDoc error:', error);
  });
}

export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  return addDoc(colRef, data).catch((error) => {
    console.error('addDoc error:', error);
    return null;
  });
}

export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data).catch((error) => {
    console.error('updateDoc error:', error);
  });
}

export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef).catch((error) => {
    console.error('deleteDoc error:', error);
  });
}