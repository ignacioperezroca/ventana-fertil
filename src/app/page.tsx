import VentanaFertilApp from "@/components/ventana-fertil-app";
import { CloudSyncBridge } from "@/components/sync/CloudSyncBridge";

export default function Home() {
  return <><CloudSyncBridge /><VentanaFertilApp /></>;
}
