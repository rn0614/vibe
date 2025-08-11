import { Logo } from "@/components/atoms/Logo";
import { IconButton } from "@/components/atoms/IconButton";

export const BrandSection  = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
  return (
    <div className="d-flex align-items-center">
      <IconButton icon="☰" onClick={onMenuToggle} className="me-3" />
      <Logo />
    </div>
  );
};
