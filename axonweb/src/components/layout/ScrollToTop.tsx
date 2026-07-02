import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ===========================================================================
// RESET DE SCROLL ENTRE ROTAS
// ===========================================================================
// Garante que cada troca de página comece no topo da viewport.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}
