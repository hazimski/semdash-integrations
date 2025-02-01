import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopicalMapForm } from '../../components/topical-map/TopicalMapForm';

export function TopicalMap() {
  const navigate = useNavigate();

  const handleSubmit = (keyword: string) => {
    const searchParams = new URLSearchParams({ keyword });
    navigate(`/topical-map/results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <TopicalMapForm onSubmit={handleSubmit} />
    </div>
  );
}