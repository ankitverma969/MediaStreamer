import { NavLink, useLocation } from "react-router-dom"
import "./Sidebar.css"

export function Sidebar() {
  const location = useLocation()

  const menu = [
    { name: "Home", path: "/", search: "" },
    { name: "Trending", path: "/", search: "?category=0" },
    { name: "Music", path: "/", search: "?category=10" },
    { name: "Gaming", path: "/", search: "?category=20" },
    { name: "Sports", path: "/", search: "?category=17" },
    { name: "News", path: "/", search: "?category=25" },
  ]

  function isActive(item) {
    return (
      location.pathname === item.path &&
      location.search === item.search
    )
  }

  return (
    <aside className="sidebar">
      {menu.map((item) => (
        <NavLink
          key={item.name}
          to={`${item.path}${item.search}`}
          className={`sidebar-item ${
            isActive(item) ? "active" : ""
          }`}
        >
          {item.name}
        </NavLink>
      ))}
    </aside>
  )
}
