import { ReactNode } from "react";
import { Button } from "@shared-components/ui/button";
import { Link } from "wouter";

interface PageHeaderProps {
  title: string;
  description?: string;
  buttonLabel?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
  buttonHref?: string;
}

export function PageHeader({
  title,
  description,
  buttonLabel,
  buttonIcon,
  onButtonClick,
  buttonHref,
}: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-text">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      {buttonLabel && (
        <>
          {buttonHref ? (
            <Link href={buttonHref}>
              <Button className="bg-primary hover:bg-primary-800">
                {buttonIcon && <span className="mr-2">{buttonIcon}</span>}
                {buttonLabel}
              </Button>
            </Link>
          ) : (
            <Button onClick={onButtonClick} className="bg-primary hover:bg-primary-800">
              {buttonIcon && <span className="mr-2">{buttonIcon}</span>}
              {buttonLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}