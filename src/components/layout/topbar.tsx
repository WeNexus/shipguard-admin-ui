import { Button, Icon } from "@shopify/polaris";
import { MenuIcon } from "@shopify/polaris-icons";
import { useNavigate } from "react-router";
import { clearAuth, getEmail } from "../../lib/auth-storage";

interface TopBarProps {
  onMenuButtonClick: () => void;
  open: boolean;
  activeNavItem: any;
}
const TopBar = ({ onMenuButtonClick, open, activeNavItem }: TopBarProps) => {
  const navigate = useNavigate();
  const email = getEmail();
  // Initials from the signed-in email, replacing hardcoded name/initials.
  const initials = (email ?? "?").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

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

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white">
              <span className="text-xs font-medium">{initials}</span>
            </div>
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium text-gray-700">
                {email ?? "Signed in"}
              </p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
          <Button size="slim" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
