import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, subtitle, onAdd, addLabel }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {onAdd && (
        <Button onClick={onAdd} className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          {addLabel || 'Agregar'}
        </Button>
      )}
    </div>
  );
}