import type { Lesson } from "../../features/lessons/schema";
export function WiringTable({ rows }: { rows: Lesson["wiring"] }) {
  if (!rows?.length) return null;
  return (
    <div className="wiring-table">
      <table>
        <caption>Mapa de ligações por sinal</caption>
        <thead>
          <tr>
            <th scope="col">Sinal</th>
            <th scope="col">ESP32</th>
            <th scope="col">Display</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.signal}>
              <th scope="row">{row.signal}</th>
              <td>{row.board}</td>
              <td>{row.display}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
