package com.slamperboom.utils;

import com.slamperboom.exceptions.ErrorCode;
import com.slamperboom.exceptions.UserException;
import org.jboss.logging.Logger;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.function.Function;

public class ThreadPoolReducer<INPUT, OUTPUT> {
    private final Logger logger = Logger.getLogger(this.getClass());
    private final ThreadPoolExecutor poolExecutor;

    public ThreadPoolReducer() {
        poolExecutor = (ThreadPoolExecutor) Executors.newCachedThreadPool();
    }

    public List<OUTPUT> reduceTasks(Collection<INPUT> data, Function<INPUT, Optional<OUTPUT>> converter) throws UserException {
        List<OUTPUT> nodes = new ArrayList<>(data.size());
        CountDownLatch latch = new CountDownLatch(data.size());
        for (var value : data) {
            poolExecutor.execute(() -> {
                Optional<OUTPUT> result;
                try {
                    result = converter.apply(value);
                } catch (Exception e) {
                    logger.error("Unable to collect data");
                    latch.countDown();
                    return;
                }
                synchronized (nodes) {
                    result.ifPresent(nodes::add);
                }
                latch.countDown();
            });
        }
        try {
            latch.await();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new UserException(ErrorCode.UNABLE_TO_PERFORM_ACTION, e);
        }

        return nodes;
    }
}
