import { Icon } from "@shopify/polaris";
import { MenuIcon } from "@shopify/polaris-icons";

interface TopBarProps {
  onMenuButtonClick: () => void;
  open: boolean;
  activeNavItem: any;
}
const TopBar = ({ onMenuButtonClick, open, activeNavItem }: TopBarProps) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          {open ? null : (
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 md:hidden"
              onClick={onMenuButtonClick}
            >
              <Icon source={MenuIcon} />
            </button>
          )}
          <span className="ml-4 text-xl font-semibold text-gray-800 md:ml-0">
            {activeNavItem?.name}
          </span>
        </div>

        <div className="flex items-center">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white">
              <span className="text-xs font-medium">MD</span>
            </div>
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium text-gray-700">
                MD AKHLAS UR RAHMAN
              </p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
