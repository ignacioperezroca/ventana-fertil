import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  const bars: Array<{ label: string; value: number; color: string }> = [
    { label: "O-6", value: 3.3, color: "#72b48a" },
    { label: "O-5", value: 3.4, color: "#dfb94c" },
    { label: "O-4", value: 22.0, color: "#ce7b24" },
    { label: "O-3", value: 26.7, color: "#b73f61" },
    { label: "O-2", value: 24.4, color: "#b73f61" },
    { label: "O-1", value: 18.5, color: "#d86f8f" },
    { label: "O", value: 6.8, color: "#dfb94c" },
    { label: "O+1", value: 3.3, color: "#72b48a" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background:
            "linear-gradient(180deg, #fcf7f3 0%, #fffaf8 52%, #f6ece6 100%)",
          color: "#24162f",
          fontFamily: "Geist, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 18px",
                borderRadius: 999,
                background: "rgba(75, 44, 85, 0.08)",
                fontSize: 22,
                fontWeight: 700,
                alignSelf: "flex-start",
              }}
            >
              <span>🥚</span>
              <span>Ventana Fértil</span>
            </div>
            <div style={{ fontSize: 64, lineHeight: 1, fontWeight: 700, letterSpacing: -1.5 }}>
              Entendé tu ventana fértil, día por día.
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.4, color: "#6f5c73" }}>
              Simulador visual para comprender ovulación, incertidumbre del ciclo y recordatorios educativos.
            </div>
          </div>

          <div
            style={{
              width: 284,
              padding: 24,
              borderRadius: 32,
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(232, 221, 215, 0.95)",
              boxShadow: "0 24px 70px -40px rgba(36,22,47,0.45)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: "#4b2c55" }}>Resumen visual</div>
            {[
              ["Pico", "O-3 · 26.7%"],
              ["Ventana", "O-6 a O+1"],
              ["Confianza", "Con incertidumbre"],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  borderRadius: 22,
                  border: "1px solid rgba(232, 221, 215, 1)",
                  padding: "14px 16px",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#6f5c73" }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "flex-end",
            marginTop: 10,
            paddingTop: 12,
          }}
        >
          {bars.map((bar) => (
            <div key={bar.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 58,
                  height: Math.max(18, (bar.value / 27) * 200),
                  borderRadius: 18,
                  background: `linear-gradient(180deg, ${bar.color} 0%, rgba(255,255,255,0.1) 100%)`,
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
                }}
              />
              <div style={{ fontSize: 16, fontWeight: 700, color: "#6f5c73" }}>{bar.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
