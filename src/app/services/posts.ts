import { DocumentData, Query, collection, getDocs } from "firebase/firestore";
import { firestore } from "../config/firebase.config";

export async function getPosts(query?: Query): Promise<[]> {
  let querySnapshot = null;

  if (query) {
    querySnapshot = await getDocs(query);
  } else {
    querySnapshot = await getDocs(collection(firestore, "post"));
  }

  const localPosts = querySnapshot.docs.map((doc: DocumentData) => {
    return { ...doc.data(), id: doc.id };
  });

  return localPosts as [];
}
