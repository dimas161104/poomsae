"use client";

import { useState } from "react";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function TesFirebase() {
  const [hasil, setHasil] = useState("Belum dites");

  async function jalankanTes() {
    setHasil("Menguji...");
    try {
      await addDoc(collection(db, "tes"), {
        pesan: "halo dari poomsae-online",
        waktu: serverTimestamp(),
      });
      const snap = await getDocs(collection(db, "tes"));
      setHasil(`BERHASIL. Jumlah dokumen di koleksi "tes": ${snap.size}`);
    } catch (e) {
      setHasil("GAGAL: " + (e as Error).message);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Tes Koneksi Firebase</h1>
      <button onClick={jalankanTes} style={{ padding: 8, border: "1px solid #888" }}>
        Jalankan tes
      </button>
      <p>{hasil}</p>
    </div>
  );
}