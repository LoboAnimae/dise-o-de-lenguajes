import IIterable, {IGetContextOptions, IGetContextResult} from '../Interfaces/IIterable';
import CError from './CError';


export class CIterable implements IIterable {
    static at<T>(iter: Iterable<T>, index: number, options?: IGetContextOptions): T | undefined {
        const arrayT = [...iter];
        if (index >= 0 && index < arrayT.length) return arrayT[index];
        return options?.ifUndefined;
    }

    static getContext<T>(iter: Iterable<T>, index: number, options?: IGetContextOptions): IGetContextResult<T> {
        let error = '';

        if (index < 0) error = 'Invalid index in Preprocessor: Expected a number greater than 0';

        if (error) {
            throw new Error(
                CError.generateErrorLexer(
                    {
                        message: error,
                        from: 0,
                        to: error.length,
                        lineContent: '',
                    },
                ),
            );
        }

        const arrayCopyT: T[] = [...iter];
        const [previousValue, currentValue, nextValue] = [-1, 0, 1].map((position: number) =>
            this.at(arrayCopyT, index + position, options),
        );
        const returnObj: IGetContextResult<T> = {previousValue, currentValue, nextValue};

        if (options?.combine) {
            // @ts-ignore
            const combinedPrevious = previousValue + currentValue;
            // @ts-ignore
            const combinedNext = currentValue + nextValue;
            returnObj.extended = {combinedPrevious, combinedNext};
        }


        return returnObj;

    }

    at<T>(iter: Iterable<T>, index: number): T | undefined {
        return CIterable.at<T>(iter, index);
    }

    getContext<T>(iter: Iterable<T>, index: number): IGetContextResult<T> {
        return CIterable.getContext<T>(iter, index);
    }

}