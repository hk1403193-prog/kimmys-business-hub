import { sampleCampaigns, sampleFollowUps } from '../sample/data'
import { Notice } from '../components/Notice'
import { SectionIntro } from '../components/SectionIntro'

export function MarketingView() {
  return (
    <div className="stack">
      <SectionIntro title="Marketing">
        Practice campaigns and follow-ups. Nothing on this screen is sent.
      </SectionIntro>
      <Notice>
        Phase 1 has no texting, email, or ad account. These cards are
        placeholders.
      </Notice>
      <section className="stack" aria-labelledby="campaigns-title">
        <h2 id="campaigns-title">Campaigns</h2>
        <ul className="card-list">
          {sampleCampaigns.map((campaign) => (
            <li key={campaign.id} className="card">
              <div className="card-top">
                <p className="card-title">{campaign.name}</p>
                <span className="pill pill-new">{campaign.status}</span>
              </div>
              <p className="card-body">{campaign.detail}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="stack" aria-labelledby="followups-title">
        <h2 id="followups-title">Follow-ups</h2>
        <ul className="card-list">
          {sampleFollowUps.map((item) => (
            <li key={item.id} className="card">
              <p className="card-title">{item.customer}</p>
              <p className="card-meta">{item.action}</p>
              <p className="card-meta">{item.when}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
