"use client";

import { useState } from "react";

export type RequestFormProps = {
  satname: string;
  sat: bigint;
  inscriptionId: string;
  inscriptionUrl: string;
  endpoint: string;
};

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export function RequestForm({
  satname,
  sat,
  inscriptionId,
  inscriptionUrl,
  endpoint,
}: RequestFormProps) {
  const [status, setStatus] = useState<SubmitStatus>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const formData = new FormData(event.currentTarget);
    formData.set("submitted_at", new Date().toISOString());

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      setStatus(response.ok ? "success" : "error");
      if (response.ok) {
        event.currentTarget.reset();
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="request-form" onSubmit={onSubmit}>
      <div className="request-form-grid">
        <label className="request-form-field">
          <span>Satname</span>
          <input name="satname" readOnly value={satname} />
        </label>

        <label className="request-form-field">
          <span>Inscription ID</span>
          <input name="inscription_id" readOnly value={inscriptionId} />
        </label>
      </div>

      <input type="hidden" name="sat_number" value={sat.toString()} />
      <input type="hidden" name="inscription_url" value={inscriptionUrl} />
      <input
        type="hidden"
        name="source"
        value="inscriptions-on-satnames live discovery"
      />

      <label className="request-form-field">
        <span>Twitter/X username</span>
        <input
          name="twitter_username"
          placeholder="@username (optional)"
          autoComplete="off"
        />
      </label>

      <div className="request-form-actions">
        <button
          type="submit"
          className="secondary-button"
          disabled={status === "submitting" || endpoint.length === 0}
        >
          {status === "submitting" ? "Submitting..." : "Submit request"}
        </button>
        {endpoint.length === 0 ? (
          <p className="request-form-message request-form-message-error">
            Submission is not configured yet.
          </p>
        ) : null}
        {status === "success" ? (
          <p className="request-form-message request-form-message-success">
            Request received.
          </p>
        ) : null}
        {status === "error" ? (
          <p className="request-form-message request-form-message-error">
            Request could not be submitted right now.
          </p>
        ) : null}
      </div>
    </form>
  );
}
