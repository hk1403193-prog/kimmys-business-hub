import { samplePartners } from '../sample/data'
import { Notice } from '../components/Notice'
import { SectionIntro } from '../components/SectionIntro'

export function PartnersView() {
  return (
    <div className="stack">
      <SectionIntro title="Partners">
        Placeholder cards for local business partnerships.
      </SectionIntro>
      <Notice>
        Every partner on this screen is fictional. No business was contacted.
      </Notice>
      <ul className="card-list">
        {samplePartners.map((partner) => (
          <li key={partner.id} className="card">
            <div className="card-top">
              <p className="card-title">{partner.name}</p>
              <span className="pill pill-accepted">{partner.status}</span>
            </div>
            <p className="card-meta">{partner.kind}</p>
            <p className="card-body">{partner.note}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
