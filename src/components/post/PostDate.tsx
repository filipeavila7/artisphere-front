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
    return <span>Publicado agora</span>;
  }

  if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return (
      <span>
        Publicado há {minutes} {minutes === 1 ? "minuto" : "minutos"}
      </span>
    );
  }

  if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return (
      <span>
        Publicado há {hours} {hours === 1 ? "hora" : "horas"}
      </span>
    );
  }

  if (diffInSeconds < month) {
    const days = Math.floor(diffInSeconds / day);

    return (
      <span>
        Publicado há {days} {days === 1 ? "dia" : "dias"}
      </span>
    );
  }

  if (diffInSeconds < sixMonths) {
    const months = Math.floor(diffInSeconds / month);

    return (
      <span>
        Publicado há {months} {months === 1 ? "mês" : "meses"}
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