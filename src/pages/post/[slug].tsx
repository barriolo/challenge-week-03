import Prismic from '@prismicio/client';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }
  const amountWordsOfBody = RichText.asText(
    post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
  ).split(' ').length;

  const amountWordsOfHeading = post.data.content.reduce((acc, data) => {
    if (data.heading) {
      return [...acc, ...data.heading.split(' ')];
    }

    return [...acc];
  }, []).length;


  const readingTime = Math.ceil(
    (amountWordsOfBody + amountWordsOfHeading) / 200
  );
  return (
    <>
    <Head>
      <title>{post?.data?.title} | Space Traveling</title>
    </Head>

    <Header />

    {post.data.banner.url && (
      <section className={styles.banner}>
        <img src={post?.data?.banner?.url} alt="Banner" />
      </section>
    )}

    <main className={commonStyles.content}>
      <article className={styles.post}>
        <h1>{post?.data?.title}</h1>

        <div className={styles.postInfo}>
          <span>
            <FiCalendar size={20} color="#BBBBBB" />
            {format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </span>

          <span>
            <FiUser size={20} color="#BBBBBB" />
            {post?.data?.author}
          </span>

          <span>
            <FiClock size={20} color="#BBBBBB" />
            {readingTime} min
          </span>
        </div>


        <div className={styles.postContent}>
          {post?.data?.content.map(({ heading, body }) => (
            <div key={heading}>
              {heading && <h2>{heading}</h2>}

              <div
                className={styles.postSection}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
              />
            </div>
          ))}
        </div>
      </article>
    </main>
  </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    { pageSize: 2 }
  );

  const paths = posts.results.map(result => {
    return {
      params: {
        slug: result.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content,
      subtitle: response.data.subtitle
    },
  };

  return {
    props: {
      post
    }
  }
};
