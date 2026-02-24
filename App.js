import { useEffect } from "react";
import { initDatabase } from "./src/database/schema";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  return <AppNavigator />;
}
