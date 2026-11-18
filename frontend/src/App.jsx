import { useState } from 'react'
import { API, zapytanie } from './api'

export default function App() {
  const [partnerzy, setPartnerzy] = useState([]);
  const [blad, setBlad] = useState(null);
  
 