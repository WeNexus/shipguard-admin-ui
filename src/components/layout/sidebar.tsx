import type { SidebarProps } from "./type";
import { Icon } from "@shopify/polaris";
import { EnterIcon, ProfileIcon, XIcon } from "@shopify/polaris-icons";
import { Link } from "react-router";

const ShipGuardLogo =
  "https://shipguard.nyc3.cdn.digitaloceanspaces.com/ShipGuard%20Widget%20Assets/app-logo/Inhouse%20Shipping%20Protection.png";

const Sidebar = ({ isOpen, setIsOpen, navItems }: SidebarProps) => {
  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 h-full transform bg-black transition duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <img src={ShipGuardLogo} alt="ShipGuard Logo" className="h-8 w-8" />
            <span className="ml-2 text-xl font-bold text-white">ShipGuard</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className=" hover:text-gray-300  text-white"
          >
            <Icon source={XIcon} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2">
          {navItems.map((item) => (
            <Link to={item.url} key={item.name}>
              <span
                className={`group flex items-center rounded-md px-2 py-3 my-3 text-lg font-medium  ${
                  item.active
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-black hover:text-white"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 " />
                <div className="flex gap-2 items-center ml-2">
                  {" "}
                  {item.name}
                  {item.hasDropdown && (
                    <svg
                      className="ml-auto h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </div>
              </span>
            </Link>
          ))}
        </nav>

        {/* Support section */}
        <div className="mt-6 border-t border-gray-700 pt-4">
          <span className="px-4 mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            SUPPORT
          </span>
          <Link to="/#">
            <span className="mt-2 flex items-center rounded-md px-4 py-3 text-lg font-medium text-gray-300 hover:bg-black hover:text-white">
              <span>
                <Icon source={ProfileIcon} />
              </span>
              <div className="flex gap-2 items-center ml-2">
                Profile
                <svg
                  className="ml-auto h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </span>
          </Link>
          <Link to="/#">
            <span className="mt-1 flex items-center rounded-md px-4 py-3 text-lg font-medium text-gray-300 hover:bg-black hover:text-white">
              <span>
                {" "}
                <Icon source={EnterIcon} />
              </span>
              <span className="ml-2"> Logout</span>
            </span>
          </Link>
        </div>

        {/* Navidium Returns */}
        <div className="mt-6 px-4">
          <div className="flex items-center">
            <img
              src={ShipGuardLogo}
              alt="Navidium Returns"
              className="h-6 w-6"
            />
            <span className="ml-2 text-sm font-medium text-white">
              Navidium
            </span>
            <span className="ml-2 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
              NEW!
            </span>
          </div>
          <div className="mt-2 flex items-center">
            <img src={ShipGuardLogo} alt="Dynamatic" className="h-6 w-6" />
            <span className="ml-2 text-sm font-medium text-white">
              dynamatic
            </span>
            <span className="ml-2 rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-black">
              NEW!
            </span>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden w-64 flex-shrink-0  md:block"
        style={{ backgroundColor: "#141313" }}
      >
        <div className="flex h-16 items-center justify-center">
          <img src={ShipGuardLogo} alt="ShipGuard Logo" className="h-8 w-8" />
          <div className="flex flex-col">
            <span className="ml-2 text-xl font-bold text-white">ShipGuard</span>
            {/*<span className="ml-2 font-bold text-white">shipping protection</span>*/}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2">
          {navItems.map((item) => (
            <Link to={item.url} key={item.name}>
              <span
                className={`group flex items-center rounded-md px-2 py-3 my-3 text-lg font-medium ${
                  item.active
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-black hover:text-white"
                }`}
              >
                <span>
                  <Icon source={item.icon} />
                </span>

                <div className="flex gap-2 items-center ml-2">
                  {item.name}
                  {item.hasDropdown && (
                    <svg
                      className="ml-auto h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </div>
              </span>
            </Link>
          ))}
        </nav>

        {/* Support section */}
        <div className="mt-6 border-t border-gray-700 pt-4">
          <span className="px-4 mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            SUPPORT
          </span>
          <Link to="/#">
            <span className="mt-2 flex items-center rounded-md px-4 py-3 text-lg font-medium text-gray-300 hover:bg-black hover:text-white">
              <span>
                <Icon source={ProfileIcon} />
              </span>
              <div className="flex gap-2 items-center ml-2">
                Profile
                <svg
                  className="ml-auto h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </span>
          </Link>
          <Link to="/#">
            <span className="mt-1 flex items-center rounded-md px-4 py-3 text-lg font-medium text-gray-300 hover:bg-black hover:text-white">
              <span>
                {" "}
                <Icon source={EnterIcon} />
              </span>
              <span className="ml-2"> Logout</span>
            </span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
