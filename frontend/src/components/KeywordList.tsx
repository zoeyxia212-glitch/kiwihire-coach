type KeywordListProps = {
  title: string;
  keywords: string[];
};

export default function KeywordList({ title, keywords }: KeywordListProps) {
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {keywords.map((keyword) => (
          <li key={keyword}>{keyword}</li>
        ))}
      </ul>
    </div>
  );
}

