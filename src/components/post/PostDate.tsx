type PostDateProps = {
  date: string;
};

function PostDate({ date }: PostDateProps) {
  const publishedDate = new Date(date);
  const now = new Date();

  const diffInSeconds = Math.floor(
    (now.getTime() - publishedDate.getTime()) / 1000
  );

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const sixMonths = 6 * month;

  if (diffInSeconds < minute) {
    return <span>Posted now</span>;
  }

  if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return (
      <span>
        Posted {minutes} {minutes === 1 ? "minute ago" : "minutes ago"}
      </span>
    );
  }

  if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return (
      <span>
        Posted {hours} {hours === 1 ? "hour ago" : "hours ago"}
      </span>
    );
  }

  if (diffInSeconds < month) {
    const days = Math.floor(diffInSeconds / day);

    return (
      <span>
        Posted {days} {days === 1 ? "day ago" : "days ago"}
      </span>
    );
  }

  if (diffInSeconds < sixMonths) {
    const months = Math.floor(diffInSeconds / month);

    return (
      <span>
        Posted {months} {months === 1 ? "month ago" : "months ago"}
      </span>
    );
  }

  return (
    <span>
      {publishedDate.toLocaleDateString("pt-BR")}
    </span>
  );
}

export default PostDate;