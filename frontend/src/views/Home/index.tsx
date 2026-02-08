import { Save } from "../../components/buttons/Save";
import { Edit } from "../../components/buttons/Edit";

export default function Home() {
  return (
    <div>
      <h2>home</h2>
      <Save onClick={() => console.log("Save clicked")} disabled={false} />
      <Edit onClick={() => console.log("Edit clicked")} disabled={false} />
    </div>
  );
}
