import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AssistantPage from '@/pages/AssistantPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AssistantPage />} />
      </Routes>
    </BrowserRouter>
  );
}
