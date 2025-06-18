import React from "react";

interface PageTitleProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="flex items-center">
        {icon && (
          <div className="mr-3 flex-shrink-0 rounded-md bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="mt-4 md:mt-0">{action}</div>}
    </div>
  );
};

export default PageTitle;