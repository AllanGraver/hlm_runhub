export default function PageTitle({eyebrow,title,description}){return <div className="page-title"><small>{eyebrow}</small><h1>{title}</h1>{description&&<p>{description}</p>}</div>}
