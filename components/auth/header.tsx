interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <h1 className="text-3xl font-semibold">🏛️ Museum</h1>
      <p className="text-muted-forground text-sm">{label}</p>
    </div>
  );
};
