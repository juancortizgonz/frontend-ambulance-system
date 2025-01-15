import { NavLink } from "react-router";

const Navbar = () => {

    return (
        <>
            <nav>
                <ul>
                    <li>
                        <NavLink to="/login" >Ingresar</NavLink>
                    </li>
                    <li>
                        <NavLink to="/faq" >FAQ</NavLink>
                    </li>
                </ul>
            </nav>
        </>
    )
}

export default Navbar;